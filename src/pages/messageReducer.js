import data from './data'

function messageReducer(state, payload) {
  switch(payload.type) {
    case 'initial':
      if(state.length) return merge([...state], payload.data)
      return payload.data
    case 'create':
      return create([...state], payload.data)
    case 'offline':
      return offline([...state], payload.data)
    case 'message-delevered':
      return messageDelevered([...state], payload.data)
    case 'update_seen':
      return update_seen([...state], payload.data.id, payload.data.createdAt, payload.data.confirmation ?? false)
    case 'push':
      return push([...state], payload.data.id, payload.data.messages)
    default:
      return state
  }
}

function merge(state, data) {
  let ids = state.map(el => el.id)

  data.forEach(el => {
    if(!ids.includes(el.id)) state.push(el)
    // else {
    //   for(let i = 0; i < state.length; i++) {
    //     if(state[i].id == el.id) {
    //       state[i].messages = el.messages
    //       state[i].unread = el.unread
    //       break
    //     }
    //   }
    // }
  })

  return state
}

function create(state, users) {
  let ids = state.map(el => el.id)

  if(users instanceof Array) {
    let newusers = users.filter(el => !ids.includes(el._id))

    newusers.forEach(el => {
      state.push({
        id: el._id,
        user: el,
        messages: [],
        unread: 0,
        online: true
      })
    })

    let online_users_ids = users.map(el => el._id)
    state.forEach(el => {
      if(online_users_ids.includes(el.id)) {
        el.online = true
      }
    })

    return state
  }
  if(!ids.includes(users._id)) {
    state.push({
      id: users._id.toString(),
      user: users,
      messages: [],
      unread: 0,
      online: true
    })

    return state
  }

  state.forEach(el => {
    if(el.id == users._id) {
      el.online = true
    }
  })

  return state
}

function update_seen(state, chatId, createdAt, confirmation = false) {
  let found = state.find((item) => item.id == chatId)
  if(!found) return state
  

  let filtered = found.messages.filter(item => {
      if(confirmation) 
        return item.to == chatId && !item.seen && item.createdAt <= createdAt
      else 
        return item.from == chatId && !item.seen && item.createdAt <= createdAt
    })
    
    filtered.forEach(item => {
      item.seen = true
    })

    found.unread = found.unread ? found.unread - filtered.length : 0
  return state
}

function push(state, id, messages) {
  let found = state.find((item) => item.id == id)
  if(!found) return state
  
  if(messages instanceof Array) {
    found = {
      ...found,
      messages: [
        ...found.messages,
        ...messages
      ],
      skip: (found.skip || 1) + messages.length
    }
    
    state.splice(state.findIndex(el => el.id == found.id), 1, found)
    return state
  }


  found.messages.unshift(messages)
  found.skip++

  if(messages.from == id) {
    found.unread++
  }

  return state
}

function messageDelevered(state, data) {
  let found = state.find(el => el.id == data.id)
  if(!found) return state

  for(let i = 0; i < found.messages.length; i++) {
    found.messages[i].createdAt = data.message.createdAt
    found.messages[i].status = 'delevered'
    found.messages[i].updatedAt = data.message.updatedAt
    found.messages[i]._id = data.message._id
    break
  }

  return state
}

function offline(state, id) {

  for(let i = 0; i < state.length; i++) {
    if(state[i].id == id) {
      state[i].online = false
      break
    }
  }

  return state
}

export default messageReducer