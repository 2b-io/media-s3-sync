import serializeError from 'serialize-error'

import s3 from 'infrastructure/s3'

export default {
  async head({ bucket, key }) {
    return await s3.headObject({
      Bucket: bucket,
      Key: key
    }).promise()
  },
  async list({ bucket, params }) {
    return await s3.listObjectsV2({
      Bucket: bucket,
      ...params
    }).promise()
  }
}
