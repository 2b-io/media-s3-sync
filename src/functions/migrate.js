import elastic from 'services/elastic'
import mediaMapping from 'mapping/media'
import media from 'services/media'

export default async () => {
  await elastic.initMapping('media', 'media', mediaMapping)
  const listObjects = await media.list()
  const listData = await Promise.all(listObjects.map((object) => {
    return media.head(object)
  }))
  return await listData.map((data) => {
    elastic.create(data)
  })

}
