import victoryBgm from '@/assets/bgm/victory.mp3'
import tetterette from '@/assets/bgm/tetterette.wav'

export const audioFiles = [victoryBgm, tetterette]

const audioCache = new Map<string, HTMLAudioElement>()

export const preloadAudioFiles = () => {
    audioFiles.forEach((path) => {
        if (!audioCache.has(path)) {
            const audio = new Audio(path)
            audio.preload = 'auto'
            audio.muted = true
            audio.load()
            audio
                .play()
                .then(() => {
                    audio.pause()
                    audio.muted = false
                    audioCache.set(path, audio)
                    console.log(`${path} is preloaded successfully.`)
                })
                .catch((error) => {
                    console.warn(`Error preloading ${path}:`, error)
                })
        }
    })
}

export const audioFileIndexMap = {
    victory: 0,
    tetterette: 1,
}

// 例：playAudio('victory')
export const playAudio = (key: keyof typeof audioFileIndexMap) => {
    const index = audioFileIndexMap[key]
    if (index !== undefined) {
        const path = audioFiles[index]
        const audio = audioCache.get(path) || new Audio(path)
        audio.play().catch((error) => {
            console.warn(`Error playing ${path}:`, error)
        })
    } else {
        console.warn(`Audio key "${key}" not found.`)
    }
}
