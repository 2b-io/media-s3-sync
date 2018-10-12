import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'

export default {
  async head({ key }) {
    return await s3.headObject({
      Bucket: config.aws.s3.bucket,
      Key: key
    }).promise()
  },
  async list({ params }) {
    return await s3.listObjectsV2({
      Bucket: config.aws.s3.bucket,
      ...params
    }).promise()
  }
}
