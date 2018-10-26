export default {
  key: {
    type: 'keyword',
  },
  isOrigin: {
    type: 'boolean',
  },
  originUrl: {
    type: 'keyword',
  },
  preset:{
    type: 'keyword'
  },
  contentType: {
    type: 'keyword'
  },
  lastModified: {
    type: 'date'
  },
  contentLength: {
    type: 'long'
  },
  migrationVersion: {
    type: 'keyword'
  }
}
