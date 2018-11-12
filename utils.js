exports.randomCode = (length) => {
  let str = "";
  for ( ; str.length < length; str += Math.random().toString( 36 ).substr( 2 ) );
  return str.substr( 0, length );
}