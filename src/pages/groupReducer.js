import { merge, push, messageDelevered } from './messageReducer'

function groupReducer(state, payload) {
  switch(payload.type) {
    case 'initial':
      if(state.length) return merge([...state], payload.data)
      return payload.data
    case 'push':
      return push([...state], payload.data.id, payload.data.messages)
    case 'users': 
      return add_users([...state], payload.data)
    case 'update_seen': 
      return seen([...state], payload.data)
    case 'member-online':
      return memberOnline([...state], payload.data)
    case 'member-offline':
      return memberOffline([...state], payload.data)
    case 'message-delevered':
      return messageDelevered([...state], payload.data)
    default:
      return state
  }
}

function memberOffline(state, data) {
  let group = state.find(el => el.id == data.group)

  if(group.online) {
    group.online = group.online?.filter(el => el != data.member)
  }

  return state
}

function memberOnline(state, data) {
  let group = state.find(el => el.id == data.group)

  if(group.online) {
    if(data.member instanceof Array) {
      let temp = new Set([...group.online, ...data.member])

      group.online = [...temp]
    } else {
      group.online = [...(new Set([...group.online, data.member]))]
    }
  } else {
    if(data.member instanceof Array) {
      group.online = data.member
    } else {
      group.online = [data.member]
    }
  }

  return state
}

function add_users(state, data) {
  let group = state.find(el => el.id == data.id)

  data?.users.forEach(user => {
    if(!group.users.find(el => el._id == user._id)) {
      group?.users.push(user)
    }
  })

  return state
}

function seen(state, data) {
  let g = state.find(g => g.id == data.id)

  if(g) {
    let length = g.messages
      .filter(el => el.createdAt <= data.createdAt)?.length

    g.unread = g.unread - length
  }

  return state
}

export default groupReducer