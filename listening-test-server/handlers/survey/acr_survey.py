from datetime import datetime

from bson import ObjectId
from handlers.base import BaseHandler
from handlers.miscellanea.test_responses import switch_response_collection


class AcrSurveyHandler(BaseHandler):
    def prepare(self):
        self.test_name = 'acr'

    async def get(self):
        _id = self.get_argument('_id')
        data = self.db[self.test_name + 'Tests'].find_one({'_id': ObjectId(_id)},
                                                          {'_id': 0, 'createdAt': 0, 'modifiedAt': 0})
        # Add testId field, it will appear in response after user's submission
        data['testId'] = ObjectId(_id)
        self.dumps_write(data)

    async def post(self):
        body = self.loads_body()
        body['createdAt'] = datetime.now()
        result = self.db[self.test_name + 'Surveys'].insert_one(body)
        self.dumps_write(result.inserted_id)

    async def delete(self):
        _id = self.get_argument('_id')

        result = self.db[self.test_name + 'Surveys'].delete_one({'_id': ObjectId(_id)})
        print(result.deleted_count)
