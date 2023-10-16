async function sendMsg(msg){
    return  chrome.runtime.sendMessage(msg);
}

(async ()=>{
    console.log('Injeced say hi');
    const name = prompt('Please Enter Your Name 👇') ?? 'There 😀';
    alert(`Hi ${name}`);
    let tabId =  await sendMsg({for:"activeTabId"});
    alert(`current tabId is ${tabId} 😊`);
    console.log('ended successfully 😍');
})();
