import formatParams from './format-params'
import media from ',/services/media'
import elastic from 'services/elastic'

export default async (event) => {
  if (event.Records.length) {
    const key = event.Records[0].s3.object.key
    const s3Object = await media.head({ key }).promise()
    const params = formatParams({ s3Object, key })
    const fileExists = await elastic.checkExists({
      index: 'media',
      type: 'media',
      id: key
    })

    if (fileExists) {
      await elastic.update({
        index: 'media',
        type: 'media',
        id: key,
        params
      })
    }else {
      await elastic.create({
        index: 'media',
        type: 'media',
        id: key,
        params
      })
    }
  }
}
