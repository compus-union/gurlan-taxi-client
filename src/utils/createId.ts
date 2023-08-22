async function createId() {
  let id = Math.floor(Math.random() * 9999999);

  return id;
}

export default createId;
