import serializeError from 'serialize-error'

import s3 from 'infrastructure/s3'

export default {
  async head({ bucket, key }) {
    try {
      return await s3.headObject({
        Bucket: bucket,
        Key: key
      }).promise()
    } catch (error) {
      return {
        statusCode: 500,
        body: serializeError(error)
      }
    }
  },
  async list({ bucket, params }) {
    try {
      return await s3.listObjectsV2({
        Bucket: bucket,
        ...params
      }).promise()
    } catch (error) {
      return {
        statusCode: 500,
        body: serializeError(error)
      }
    }
  }
}
