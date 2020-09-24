import pymongo
from bson import ObjectId
from handlers.base import BaseHandler
from datetime import datetime


class AcrTestCsvDownload(BaseHandler):
    async def prepare(self):
        self.user_id = await self.auth_current_user()
        self.test_name = 'acr'

    # Download api
    async def get(self):
        # Get responses, based on 1 test
        test_id = self.get_argument('testId')
        data = self.db[self.test_name + 'Surveys'].find({'userId': self.user_id, 'testId': ObjectId(test_id)})\
            .sort('createdAt', pymongo.DESCENDING)
        # If there is no data here
        if data.count() == 0:
            self.set_error(404, 'There is no enough ' + self.test_name + ' Test responses')
            return

        # Build file name with test type and datetime
        csv_name = f"{self.test_name}_Test-{datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
        # Set http response header for downloading file
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', f'attachment; filename="{csv_name}"')

        # Set build csv and write
        is_header_writen = False
        for row in data:
            if not is_header_writen:
                # Tags header: replace , for |. Add extra , for Comment field
                tag_list = []
                for x in row['items']:
                    t = build_tags(x)
                    if t is not None:
                        tag_list.append(t)
                        if check_is_timed(row):
                            tag_list.append('')
                # Tags label + blanks + tags for examples + next row
                self.write('Tags' + ',,' + ','.join(tag_list) + '\n')

                # Questions header. Examples header: Example and Comment
                header_list = ['Name', 'Date']
                for x in row['items']:
                    t = build_header(x)
                    if t is not None:
                        header_list.append(t)
                        if check_is_timed(row):
                            header_list.append('Time (s)')
                self.write(','.join(header_list) + '\n')
                is_header_writen = True

            # Build three different lists of data
            value_list = [row['name'], row['createdAt'].strftime("%Y-%m-%d %H:%M:%S")]
            for x in row['items']:
                t = build_row(x)
                if t is not None:
                    value_list.append(t)
                    if check_is_timed(row):
                        value_list.append(str(x['time']) if 'time' in x else '0')

            # Append these three list and write
            self.write(','.join(value_list) + '\n')
        await self.finish()


def build_tags(item):
    if item['type'] == 1 or item['type'] == 3:  # Question or training type
        return ''
    elif item['type'] == 2:  # Example
        if 'example' in item and 'tags' in item['example']:
            return (item['example']['tags'] or '').replace(',', '|')
        else:
            return ''
    else:
        return None


def build_header(item, suffix='rating'):
    if item['type'] == 1:  # Question
        if 'questionControl' in item and 'question' in item['questionControl']:
            return f'"{item["questionControl"]["question"] or ""}"'
        else:
            return ''
    elif item['type'] == 2 or item['type'] == 3:  # Example with suffix or training
        if 'example' in item:
            return f'"{item["title"]} {suffix if item["type"] == 2 else ""}"'
        else:
            return ''
    else:  # 0: Section header, 3 Training
        return None


def build_row(item, value_source='medias'):
    if item['type'] == 1:  # Question
        if 'questionControl' in item and 'value' in item['questionControl']:
            # Checkbox has comma, so we need "
            return f'"{item["questionControl"]["value"] or ""}"'
        else:
            return ''
    elif item['type'] == 2:  # Example
        if 'example' in item and value_source in item['example']:
            row_values = [(a['value'] or '') if 'value' in a else '' for a in item['example'][value_source]]
            return f'"{",".join(row_values)}"'
        else:
            return ''
    elif item['type'] == 3:  # Training
        if 'example' in item and 'fields' in item['example'] \
                and len(item['example']['fields']) > 1 and 'value' in item['example']['fields'][1]:
            return f'"{item["example"]["fields"][1]["value"] or ""}"'
        else:
            return ''
    else:  # 0: Section header
        return None


def check_is_timed(row):
    return 'settings' in row and 'isTimed' in row['settings'] and row['settings']['isTimed']
