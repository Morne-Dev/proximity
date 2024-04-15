<template>
    <v-container class="min-h-content py-5">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <h1 class="text-center">Security Camera</h1>
          <p class="text-h4 text-center">Multiple object detection with emergency alarm</p>
          <v-btn color="primary">Vuetify Button</v-btn>
          <div v-if="!showBtn" class="text-center my-5">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span>Loading...</span>
          </div>
          <section ref="demosSection" v-if="showBtn">
            <div class="camView">
              <button v-if="!camStarted" @click="enableCam">Enable Webcam</button>
              <video ref="video" autoplay muted style="height: 460px; width: 100%;"></video>
            </div>
            <p class="text-center">The detected objects</p>
            <p ref="onTheScreen" style="height: 250px;"></p>
            <audio ref="audio">
              <source :src="alarm" type="audio/mp3">
              Your browser does not support the audio element.
            </audio>
          </section>
          
        </v-col>
      </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { defineComponent } from 'vue';
import { VBtn, VContainer, VRow, VCol, VProgressCircular } from 'vuetify/components';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import alarm from './assets/alarm.mp3';


defineComponent({
  components: {
    VBtn,
    VContainer,
    VRow,
    VCol,
    VProgressCircular
  },
});

const video = ref(null)
const liveView = ref(null)
const demosSection = ref(null)
const onTheScreen = ref(null)
const audio = ref(null)
const showBtn = ref(false)
const camStarted = ref(false)

let model = undefined;

// loading the model
cocoSsd.load().then(function(loadedModel) {
  model = loadedModel;
  showBtn.value = true
});

async function enableCam(event) {
  if (!model) {
    return;
  }
  camStarted.value = true;
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  await navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    try {
      video.value.srcObject = stream
      console.log('try', stream)
    } catch (error) {
      console.log('catch', error)
    }

    video.value.addEventListener('loadeddata', predictWebcam);
  });
}

const children2 = ref([]);
function predictWebcam() {

  //classifying a frame in the stream.
  model.detect(video.value).then(function(predictions) {

    for (let i = 0; i < children2.value.length; i++) {
      onTheScreen.value.removeChild(children2.value[i]);

    }

    children2.value.splice(0);

    // loop through predictions
    for (let n = 0; n < predictions.length; n++) {

      if (predictions[n].score > 0.66) {
        const div = document.createElement('div');
        div.innerHTML = predictions[n].class
        //check if prediction class is person to play alarm
        if (predictions[n].class == "person") {
          audio.value.play()
        }
        onTheScreen.value.appendChild(div);
        children2.value.push(div);

      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}
</script>

<style scoped>
.camView {
  position: relative;
  width: 100%;
  margin-top: 1rem;
}

video {
  display: block;
  width: 100%;
}

p {
  margin-top: 1rem;
}
</style>
