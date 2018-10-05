import request from 'superagent'

import config from 'infrastructure/config'
import media from 'services/media'

export const put = async (event) => {
  const { serverElastic } = config
  const key = event.Records[0].s3.object.key
  const object = await media.head(key)
  const {
    ContentType: contentType,
    ContentLength: contentLength,
    LastModified : date,
    ETag: eTag
  } = object
  await request
    .put(`${ serverElastic }/media/${ contentType }/${ eTag }`)
    .set('Content-Type', 'application/json')
    .send({
      key,
      contentType,
      contentLength,
      date,
      eTag
    })
}
