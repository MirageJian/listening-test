from handlers.download_csv.ab_test_responses_download import AbTestResponsesDownload


class ImageLabelingCsvDownload(AbTestResponsesDownload):
    async def prepare(self):
        self.user_id = await self.auth_current_user()
        self.surveyCollectionName = 'imageLabelingSurveys'
