import { merge, push, messageDelevered, remove } from './messageReducer'

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
    case 'update_group': 
      return updateGroup([...state], payload.data)
    case 'remove':
      return remove([...state], payload.data)
    case 'remove_member':
      return removemember([...state], payload.data)
    case 'add_member':
      return addmember([...state], payload.data)
    case 'remove_join_request':
      return removejoinRequest([...state], payload.data)
    case 'add_correct_answers':
      return add_correct_answers([...state], payload.data)
    case 'add_questionnaire_answers':
      return add_questionnaire_answers([...state], payload.data)
    case 'add_join_requests':
      return add_join_requests([...state], payload.data)
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

function updateGroup(state, data) {
  let group = state.find(el => el.id == data.id) 

  if(!group) return state

  group.group.name = data.group.name
  group.group.description = data.group.description
  group.group.membersNickname = data.group.membersNickname
  group.group.type = data.group.type
  group.group.restriction = data.group.restriction ? data.group.restriction : group.group.restriction

  return state
}

function removejoinRequest(state, data) {
  let group = state.find(el => el.id == data.id)

  if(!group) return state

  group.joinRequests = group.joinRequests.filter(el => el._id != data.member)

  return state
}

function add_join_requests(state, data) {
  let group = state.find(el => el.id == data.id)

  if(!group) return state

  group.joinRequests = data.joinRequests

  return state
}

function add_correct_answers(state, data) {
  const group = state.find(el => el.id == data.id)

  if(!group) return state

  group.correctAnswers = data.answers || []

  return state
}

function add_questionnaire_answers(state, data) {
  let group = state.find(el => el.id == data.id)

  if(!group) return state

  group.questionnaireAnswers = data.answers || []

  return state
}

function addmember(state, data) {
  let group = state.find(el => el.id == data.id)

  if(!group) return state

  group.members.push(data.member)
  group.group.members.push(data.member._id)

  return state
}

function removemember(state, data) {
  let group = state.find(el => el.id == data.id)

  if(!group) return state

  group.members = group.members.filter(el => el._id != data.member._id)
  group.group.members = group.group.members.filter(el => el != data.member._id)

  return state
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