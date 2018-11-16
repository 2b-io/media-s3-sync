import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import mediaMapping from 'mapping/media'
import elasticSearch from 'services/elastic-search'
import media from 'services/media'
import retry from 'services/retry'
import s3toES from 'services/s3-to-es'

const fetchPage = async ({
  prefix,
  maxKeys = 10,
  continuationToken
}) => {
  const params = {
    Prefix: prefix || null,
    MaxKeys: maxKeys,
    ContinuationToken: continuationToken || null
  }
  const {
    Contents: contents,
    NextContinuationToken: nextContinuationToken,
    IsTruncated: isTruncated
  } = await media.list({ params })

  const { expiredS3Objects } = await contents.reduce(
    async (previousJob, file) => {
      const { expiredS3Objects } = await previousJob

      try {
        const { Key: key } = file
        const projectIdentifier = key.split('/')[1]
        console.log('PUSH_FILE -> ', key)

        const s3Object = await retry(10)(media.head)(key)

        // check expire
        const { Expires: expires } = s3Object

        if (!expires || expires < Date.now()) {
          console.log(`${ key } IS EXPIRED...`)

          return {
            expiredS3Objects: [ ...expiredS3Objects, key ]
          }
        }

        const paramsElasticSearch = s3toES({ s3Object, key })

        await elasticSearch.createOrUpdate(
          projectIdentifier,
          key,
          paramsElasticSearch
        )
      } catch (error) {
        console.error(error)
      }

      return {
        expiredS3Objects
      }
    },
    Promise.resolve({
      expiredS3Objects: []
    })
  )

  if (expiredS3Objects.length) {
    const deleteResult = await media.delete(expiredS3Objects)

    console.log(deleteResult)
  }

  return {
    expired: expiredS3Objects.length,
    isTruncated,
    nextContinuationToken
  }
}

export default async (event) => {
  try {
    const {
      projectIdentifier,
      continuationToken,
      maxKeys
    } = JSON.parse(event.body)

    const prefix = `${ config.aws.s3.version }/${ projectIdentifier }`

    await elasticSearch.initMapping(
      projectIdentifier,
      mediaMapping
    )

    const {
      expired,
      isTruncated,
      nextContinuationToken
    } = await fetchPage({
      prefix,
      maxKeys,
      continuationToken
    })

    if (!isTruncated) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'success',
          expired,
          isTruncated: false
        })
      }
    }

    return {
      statusCode: 206,
      body: JSON.stringify({
        message: 'partial success',
        expired,
        isTruncated: true,
        nextContinuationToken
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(serializeError(error))
    }
  }
}
