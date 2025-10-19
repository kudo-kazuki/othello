import init, { two_opt } from '../wasm_pkg/salesman.js'

self.onmessage = async (e) => {
    await init()
    const cities = e.data.cities

    // 経過メッセージ受信用
    self.addEventListener('message', (ev) => {
        try {
            const msg = JSON.parse(ev.data)
            if (msg.type === 'progress') {
                self.postMessage(msg) // Vue側に転送
            }
        } catch {}
    })

    const result = two_opt(cities)
    self.postMessage(result)
}
