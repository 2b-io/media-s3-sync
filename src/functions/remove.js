import elastic from 'services/elastic'

export default async (event) => {

  if (event.Records.length) {
    const key = event.Records[0].s3.object.key
    try {
      await elastic.remove({
        index: 'media',
        type: 'media',
        id: key
      })
      return {
        body: JSON.stringify({
          remove: key
        })
      }
    } catch (error) {
      throw error
    }
  }
}
