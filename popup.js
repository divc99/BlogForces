var following = new Array();
var read_comments=new Array();

window.onload = function(){
    chrome.storage.sync.get(null,function(result){
        if(typeof result.following != undefined){
            console.log("here");
            if(result.following.length != 0)
                following = result.following;
        }else{
            chrome.storage.sync.set({'following':following},function(){
                console.log("set the array for first time");
            })
        }
    });
    document.getElementById("follow").addEventListener("click",follow_handler);
    document.getElementById("unfollow").addEventListener("click",unfollow_handler);
}


function follow_handler(){
    chrome.tabs.query({active:true,currentWindow:true},function(tab){
        var entryno=0;
        for(let i=0;i<tab[0].url.length;++i){
            if(tab[0].url[i]<='9'&&tab[0].url[i]>='0'){
                entryno = 10*entryno+(tab[0].url[i]-'0');
            }
        } 
        console.log(entryno);
        if(following.indexOf(entryno)===-1)
            following.push(entryno);
        chrome.storage.sync.set({'following':following},function(){
            console.log(following);
        });
    });
}

function unfollow_handler(){
    chrome.tabs.query({active:true,currentWindow:true},function(tab){
        var entryno=0;
        for(let i=0;i<tab[0].url.length;++i){
            if(tab[0].url[i]<='9'&&tab[0].url[i]>='0'){
                entryno = 10*entryno+(tab[0].url[i]-'0');
            }
        }
        console.log(entryno);
        var pos = following.indexOf(entryno);
        if(pos!=-1){
            following.splice(pos,1);
        }
        console.log("removed");
        chrome.storage.sync.set({'following':following},function(){
            console.log(following);
        });
    });
}

async function getTitle(id){
    const blogEntry = fetch('http://codeforces.com/api/blogEntry.view?blogEntryId=${id}');
    const response= await blogEntry;
    const jsonData = await response.json();
    console.log(jsonData.title);
    return jsonData.title;
}

async function job(){
    chrome.storage.sync.get(null,async function(obj){
        if(typeof obj.following != undefined){
            console.log("here");
            if(obj.following.length != 0)
                following = obj.following;
        }else{
            chrome.storage.sync.set({'following':following},function(){
                console.log("set the array for first time");
            })
        }
        chrome.storage.local.get(null,function(result){
            if(typeof result.read_comments !== undefined){
                console.log("here");
                if(result.read_comments.length != 0)
                    read_comments = result.read_comments;
            }else{
                chrome.storage.sync.set({'read_comments':read_comments},function(){
                    console.log("set the array for first time");
                })
            }
        });
        var api = "http://codeforces.com/api/blogEntry.comments?blogEntryId=";
        for(let i=0;i<following.length;++i){
            if(following[i]==0)
                continue;
            var URL = api+following[i].toString();
            const fetchResult = fetch(URL);
            const response = await fetchResult;
            const jsonData = await response.json();
            if(jsonData.status !== "OK"){
                console.log("error");
            }else{
                let cnt=0;
                for(let i=0;i<jsonData.result.length;i++){
                    if(read_comments.indexOf(jsonData.result[i])===-1){
                        cnt++;
                    }
                }
                var element = document.createElement("li");
                element.textContent = getTitle(following[i]);
                var cntelement = document.createElement("p");
                cntelement.textContent = "Unread = ${cnt}";
                element.append(cntelement);
            }
        }
    });
}

setTimeout(job,1000);