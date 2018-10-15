import serializeError from 'serialize-error'

import elasticSearch from 'services/elastic-search'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(
      async (previousJob, file) => {
        await previousJob
        const { key } = file.s3.object
        try {
          return await elasticSearch.remove({ id: key })
        } catch (error) {
          console.log(serializeError(error))
        }
       }, Promise.resolve()
     )
   } else {
     return { statusCode: 500, body: event }
  }
}
