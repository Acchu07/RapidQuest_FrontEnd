async function getData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const result = await response.json();
      // console.log(result);
      return result;
    } catch (error) {
      alert(error.message);
      throw new Error(error.message);
    }
  }
  

  export {getData}