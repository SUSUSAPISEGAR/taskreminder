import { Alert, Linking, Platform } from 'react-native'
import Constants from 'expo-constants'

const GITHUB_REPO = 'SUSUSAPISEGAR/taskreminder'
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`

interface GitHubRelease {
    tag_name: string
    html_url: string
    body: string
    assets: Array<{
        browser_download_url: string
        name: string
    }>
}

export const checkForUpdates = async (manual = false) => {
    try {
        const currentVersion = Constants.expoConfig?.version || '1.0.0'
        const response = await fetch(API_URL)

        if (!response.ok) return

        const data: GitHubRelease = await response.json()
        const latestVersion = data.tag_name.replace('v', '')

        if (isNewerVersion(currentVersion, latestVersion)) {
            Alert.alert(
                'Update Tersedia! 🚀',
                `Versi terbaru (${data.tag_name}) sudah rilis.\n\nApa yang baru:\n${data.body}`,
                [
                    { text: 'Nanti saja', style: 'cancel' },
                    {
                        text: 'Download Sekarang',
                        onPress: () => Linking.openURL(data.html_url)
                    }
                ]
            )
        } else if (manual) {
            Alert.alert('Sudah Terbaru', `Aplikasi kamu (v${currentVersion}) sudah versi paling update.`)
        }
    } catch (error) {
        if (manual) {
            Alert.alert('Error', 'Gagal mengecek update. Pastikan koneksi internet aktif.')
        }
    }
}

const isNewerVersion = (current: string, latest: string): boolean => {
    const currParts = current.split('.').map(Number)
    const lateParts = latest.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
        const curr = currParts[i] || 0
        const late = lateParts[i] || 0
        if (late > curr) return true
        if (late < curr) return false
    }
    return false
}
