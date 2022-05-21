let messages = []

for(let i = 0; i < 100; i++) {
  messages.unshift({
    id: i,
    message: 'Hello my man.',
    seen: i >= 50 ? false: true,
    createdAt: new Date()
  })
}

async function getMoreData(skip, range = 0) {
  return new Promise((res, rej) => {
    res(messages.slice(skip, 20 + skip + range))
  })
}

export default messages

export {
  getMoreData
}