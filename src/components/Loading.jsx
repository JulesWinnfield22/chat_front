
function LoadingElli() {
  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

function Loading() {
  return (
    <div className="fixed flex bg-gray-300 justify-center items-center inset-0">
      <LoadingElli />
    </div>
  )
}

export default Loading
export {
  LoadingElli
}