import s3 from 'infrastructure/s3'
import config from 'infrastructure/config'

export default {
  async head(key) {
    return await s3.headObject({
      Bucket: config.aws.s3.bucket,
      Key: key
    }).promise()
  },
  async list() {
    let isTruncated = true
    let marker
    let listObjects = []

    while(isTruncated) {
      let params = {
        Bucket: config.aws.s3.bucket,
        Prefix: config.version
       }

      if (marker) {
        params.Marker = marker
      }

      try {
        const response = await s3.listObjects(params).promise()
        response.Contents.forEach(item => {
          listObjects.push(item.Key)
        })
        isTruncated = response.IsTruncated

        if (isTruncated) {
          marker = response.Contents.slice(-1)[0].Key
        }
      } catch(error) {
        throw error
      }
    }

    return listObjects
  }
}
