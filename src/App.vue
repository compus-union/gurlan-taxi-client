<script setup lang="ts">
import { Network } from '@capacitor/network'
import { onBeforeMount, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useOriginCoords } from '@/store/origin'
import { PageTransition } from 'vue3-page-transition'
import { toast, Toaster } from 'vue-sonner'
import { useSocket } from '@/store/socket'
import { storeToRefs } from 'pinia'

const socketStore = useSocket()
const originStore = useOriginCoords()
const router = useRouter()
const route = useRoute()

const { state } = storeToRefs(socketStore)

onBeforeMount(async () => {
	Network.addListener('networkStatusChange', async s => {
		if (s.connected) {
			if (route.path === '/no-internet') {
				router.go(-1)
			}

			await originStore.getCoords(false)

			return
		}

		router.push('/no-internet')
	})

	const logCurrentNetworkStatus = async () => {
		const status = await Network.getStatus()

		if (status.connected) {
			if (route.path === '/no-internet') {
				router.go(-1)
			}

			await originStore.getCoords()

			return
		}

		router.push('/no-internet')
	}

	await logCurrentNetworkStatus()
})

onMounted(async () => {
	try {
		if (route.meta?.layout === 'auth') return
		if (!state.value.connected) {
			await socketStore.connectSocket({ loading: true })
		}
		window.addEventListener('beforeunload', async e => {
			if (state.value.connected) {
				await socketStore.disconnectSocket({ loading: false })
			}
		})
	} catch (error: any) {
		toast(
			error ||
				error.response.data.msg ||
				error.message ||
				"Server bilan aloqa yo'q, dasturni boshqatdan ishga tushiring"
		)
	}
})
</script>

<template>
	<div class="app">
		<div
			class="fixed bg-primary text-primary-foreground rounded px-2 text-sm opacity-50 bottom-5 left-[60%] right-[50%] w-full"
		>
			{{ route.fullPath }}
		</div>
		<Toaster
			:close-button="true"
			:toast-options="{
				class: 'my-toast',
				style: {
					fontSize: '16px',
					fontFamily: 'Manrope, sans-serif',
					fontWeight: 600,
				},
			}"
			position="top-center"
		/>
		<router-view v-slot="{ Component }">
			<PageTransition name="fade-in-up" appear>
				<component :is="Component" />
			</PageTransition>
		</router-view>
	</div>
</template>

<style>
.vue3-progress-bar-container .vue3-progress-bar {
	background-color: #fcdc2a !important;
	height: 5px !important;
}

.my-toast,
.my-toast * {
	@apply font-manrope;
}
</style>
