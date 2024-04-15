<template>
    <v-card class="video-stream" elevation="2">
      <v-card-title>Video Stream</v-card-title>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col cols="12">
                <v-video-stream> ref="video" autoplay muted style="width: 300px; height: 300px;"></v-video-stream>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VBtn, VContainer, VRow, VCol, VProgressCircular } from 'vuetify/components';

 defineComponent({
  components: {
    VBtn,
    VContainer,
    VRow,
    VCol,
    VProgressCircular
  },
});
  
  const video = ref(null);
  
  onMounted(() => {
    startVideoStream();
  });
  
  onBeforeUnmount(() => {
    const videoElement = video.value;
    if (videoElement) {
      videoElement.srcObject = null;
    }
  });
  
  function startVideoStream() {
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        const videoElement = video.value;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Error accessing webcam:', err);
      });
  }
  </script>
  
  <style scoped>
  .video-stream {
    max-width: 400px;
    margin: auto;
    padding: 20px;
  }
  </style>
  