
const sendSms = async (text , cellphoneNumber , ems) => {

    try
    {
        
        const body = {
        to: cellphoneNumber,
        message: text,
        ems: ems
        };

        const url = "https://restapi.gsm.co.za/send/sms";
        const authorization = "Basic " + btoa(`${"atisasoftwareso"}:${"wth2siw6"}`);
        
        var headers = {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }; 

        const options = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        };

        const response = await fetch(url, options);
        console.log('😁 Vodacom Response :', await response.json());   

    }
    catch (ex) { console.log(ex);}
}

module.exports = sendSms;