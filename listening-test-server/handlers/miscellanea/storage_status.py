import os
from pymongo.database import Database
from handlers.base import BaseHandler
from tools.file_helper import sizeof_fmt


class StorageStatusHandler(BaseHandler):
    async def prepare(self):
        # Get user and check the permissions
        self.user_id = await self.auth_current_user('Storage')

    async def get(self):
        medias_checklist = get_medias_in_using(self.db)
        # TODO try to categorize video, audio and image
        target_path = 'static2/audio_files'
        # Get size of static folder
        total_size = 0
        total_num = 0
        redundant_size = 0
        if not os.path.exists(target_path):
            return
        # Walk the target direction
        for dirpath, dirnames, filenames in os.walk(target_path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                # skip if it is symbolic link
                if not os.path.islink(fp):
                    f_size = os.path.getsize(fp)
                    total_size += f_size
                    total_num += 1
                    # If a file is not in use, mark it as redundant
                    if f not in medias_checklist:
                        redundant_size += f_size

        self.dumps_write({
            'totalSize': sizeof_fmt(total_size),
            'totalNum': total_num,
            'redundantSize': sizeof_fmt(redundant_size)
        })

    async def delete(self):
        medias_checklist = get_medias_in_using(self.db)
        target_path = 'static2/audio_files'
        total_size = 0
        total_num = 0
        if not os.path.exists(target_path):
            return
        for f in os.listdir(target_path):
            # Check if file has been used, if it has then delete it
            if f not in medias_checklist:
                os.remove(os.path.join(target_path, f))
            else:
                # Add size and increase number
                total_size += os.path.getsize(os.path.join(target_path, f))
                total_num += 1

        self.dumps_write({
            'totalSize': sizeof_fmt(total_size),
            'totalNum': total_num,
            'redundantSize': 0
        })


def get_medias_in_using(db: Database) -> set:
    medias_checklist = set()
    # Get all collections and map data
    for col in db.list_collection_names():
        data = db[col].find({}, {'items.example.medias.src': 1})
        for d in data:
            if 'items' in d and d['items']:
                for i in d['items']:
                    if 'example' in i and i['example'] and 'medias' in i['example']:
                        for a in i['example']['medias']:
                            if 'src' in a and a['src']:
                                medias_checklist.add(os.path.split(a['src'])[-1])
    return medias_checklist
