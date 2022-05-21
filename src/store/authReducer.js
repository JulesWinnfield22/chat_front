
function authReducer(state, payload) {
  switch(payload.type) {
    case 'initial':
      return {...state, ...payload.data}
    case 'logout':
      return {}
    case 'update':
      return update({...state}, payload.data)
    default:
      break
  }
}

function update(state, data) {
  state.user[data.name] = data.value
  return state
}

export default authReducer