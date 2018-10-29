import elasticSearch from 'services/elastic-search'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(
      async (previousJob, file) => {
        await previousJob
        const { key } = file.s3.object
        const projectIdentifier = key.split('/')[ 1 ]
        try {
          return await elasticSearch.remove(projectIdentifier, key)
        } catch (error) {
          console.error(error)
        }
       }, Promise.resolve()
     )
   } else {
     return { statusCode: 500, body: event }
  }
}
