import { ref, onUnmounted, onMounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import config from '@/config'
import { Preferences } from '@capacitor/preferences'
import { defineStore } from 'pinia'
import { loadingController } from '@ionic/core'
import { toast } from 'vue-sonner'
import { Network } from '@capacitor/network'
import { useRouter } from 'vue-router'

export const useSocket = defineStore('socket-store', () => {
	const router = useRouter()

	const state = ref({
		connected: false,
		socketId: '',
		disconnected: false,
	})

	const socket: Socket = io(config.SERVER_PUBLIC_URL, {
		autoConnect: false,
	})

	const initConnection = async (socketId: string) => {
		try {
			const { value } = await Preferences.get({ key: 'clientOneId' })
			if (value) {
				const user = { socketId, oneId: value, type: 'client' }
				socket.emit('connection:init', { user })
			} else {
				throw new Error('Client ID not found')
			}
		} catch (error) {
			console.error('Error initializing connection:', error)
			toast('Connection initialization failed. Please try again.')
		}
	}

	socket.on('connect', async () => {
		await initConnection(socket.id as string)
		state.value.socketId = socket.id as string
		state.value.connected = true
	})

	socket.on('disconnect', () => {
		state.value.connected = false
		state.value.socketId = ''
		console.log('Disconnected from server')
	})

	socket.on('connection:error', async data => {
		if (data.status === 'bad') {
			toast(data.msg)
			state.value.connected = false
			state.value.socketId = ''
			socket.disconnect()
			await router.push('/home/deactivated')
		}
	})

	const connectSocket = async (payload: { loading?: boolean }) => {
		const loading = await loadingController.create({
			message: 'Faollik ishga tushmoqda...',
		})
		try {
			if (!state.value.connected) {
				if (payload.loading) {
					await loading.present()
				}
				socket.connect()
			} else if (state.value.connected) {
				if (payload.loading) {
					await loading.dismiss()
					return
				}
			}
		} catch (error: any) {
			console.error('Error connecting socket:', error)
			toast(
				error.message ||
					error.response?.data?.msg ||
					'Faollikni ishga tushirishda xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring'
			)
		} finally {
			if (payload.loading) {
				await loading.dismiss()
			}
		}
	}

	const disconnectSocket = async (payload: { loading?: boolean }) => {
		try {
			if (state.value.connected) {
				const { value } = await Preferences.get({ key: 'clientOneId' })
				if (value) {
					socket.emit('connection:disconnect', { user: { oneId: value } })
					state.value.disconnected = true
					state.value.socketId = ''
				} else {
					throw new Error('Driver ID not found')
				}
			}
		} catch (error: any) {
			console.error('Error disconnecting socket:', error)
			toast(
				error.message ||
					error.response?.data?.msg ||
					"Faollikni o'chirishda xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring"
			)
		}
	}

	onMounted(() => {
		Network.addListener('networkStatusChange', async status => {
			if (!status.connected) {
				await router.push('/no-internet')
			}
		})
	})

	onUnmounted(() => {
		socket.off('connect')
		socket.off('disconnect')
	})

	return {
		state,
		connectSocket,
		disconnectSocket,
		socket,
	}
})
