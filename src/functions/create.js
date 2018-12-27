import api from 'services/api'

import media from 'services/media'
import retry from 'services/retry'
import formatObjects3toES from 'services/format-object-s3-to-es'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(
      async (previousJob, file) => {
        await previousJob
        const { key } = file.s3.object
        const projectIdentifier = key.split('/')[ 1 ]

        try {
          const s3Object = await retry(10)(media.head)(key)
          const objectElasticsearch = formatObjects3toES(s3Object, key)

          const checkExistsObject = api.call(
            'head',
            `/projects/${ projectIdentifier }/files/${ encodeURIComponent(objectElasticsearch.key) }`
          )

          if (checkExistsObject) {
            const {
              originUrl,
              expires,
              isOrigin,
              lastModified,
              lastSynchronized
            } = objectElasticsearch

            return await api.call(
              'put',
              `/projects/${ projectIdentifier }/files`,
              { originUrl, expires, isOrigin, lastModified, lastSynchronized }
            )
          }

          return await api.call('post', `/projects/${ projectIdentifier }/files`, { ...objectElasticsearch })
        } catch (error) {
          console.error(error)
        }
      },
      Promise.resolve()
    )
  } else {
    return {
      statusCode: 500,
      body: event
    }
  }
}
