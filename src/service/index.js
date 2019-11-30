export async function getRandom(callBack) {
    let result = 0
    await fetch('https://api.random.org/json-rpc/2/invoke', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "generateIntegers",
            params: {
                apiKey: "853783c5-81a0-4c11-b409-4601e427205f",
                n: 1,
                min: 1,
                max: 99,
                replacement: true
            },
            id: 42
        })
    }).then((response) => response.json())
        .then((responseJson) => {
            callBack(Number(responseJson.result.random.data[0]))
        })
    return result
}