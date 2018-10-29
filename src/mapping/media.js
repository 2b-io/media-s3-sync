export default {
  key: {
    type: 'keyword',
  },
  contentType: {
    type: 'keyword'
  },
  contentLength: {
    type: 'long'
  },
  expires: {
    type: 'date'
  },
  isOrigin: {
    type: 'boolean',
  },
  lastModified: {
    type: 'date'
  },
  lastSynchronized: {
    type: 'date'
  },
  originUrl: {
    type: 'keyword',
  },
  preset:{
    type: 'keyword'
  }
}
