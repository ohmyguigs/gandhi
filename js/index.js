import { ZoomMtg } from '@zoomus/websdk';

console.log('checkSystemRequirements');
console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
// if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/1.7.4/lib', '/av'); // CDN version default
// else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/1.7.4/lib', '/av'); // china cdn option 
ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();


const API_KEY = 'MY_API_KEY';

/**
    * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
    * The below generateSignature should be done server side as not to expose your api secret in public
    * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/Web-Client-SDK/tutorial/generate-signature
    */
const API_SECRET = 'MY_API_SECRET';

testTool = window.testTool;
document.getElementById('display_name').value = "Local" + ZoomMtg.getJSSDKVersion()[0] + testTool.detectOS() + "#" + testTool.getBrowserInfo();

document.getElementById('join_meeting').addEventListener('click', (e) => {
    e.preventDefault();

    const meetConfig = {
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        meetingNumber: parseInt(document.getElementById('meeting_number').value, 10),
        userName: document.getElementById('display_name').value,
        passWord: document.getElementById('meeting_pwd').value,
        leaveUrl: 'https://zoom.us',
        role: parseInt(document.getElementById('meeting_role').value, 10)
    };

    ZoomMtg.generateSignature({
        meetingNumber: meetConfig.meetingNumber,
        apiKey: meetConfig.apiKey,
        apiSecret: meetConfig.apiSecret,
        role: meetConfig.role,
        success: res => {
            console.log('[SUCCESS] generate signature: ', res.result);
            ZoomMtg.init({
                leaveUrl: 'http://www.zoom.us',
                success() {
                  console.log('[SUCCESS] init');
                  const jointConfig = {
                    meetingNumber: meetConfig.meetingNumber,
                    userName: meetConfig.userName,
                    signature: res.result,
                    apiKey: meetConfig.apiKey,
                    passWord: meetConfig.passWord,

                  }
                  console.log('joining with this config: ', jointConfig);
                    ZoomMtg.join(
                        {
                            ...jointConfig,
                            success() {
                                console.log('[SUCCESS] join!');
                                $('#nav-tool').hide();
                            },
                            error(res) {
                                console.log('[ERROR] joining: ', res);
                            }
                        }
                    );
                },
                error(res) {
                    console.log('[ERROR] init. ', res);
                }
            });
        },
        error: err => {
          console.log('[ERROR] signature. ', err)
        }
    });
});
