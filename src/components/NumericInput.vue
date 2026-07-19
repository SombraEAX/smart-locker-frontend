<template>
  <page-body class="sl-ip">
    <padding-box style="height:100%" class="sl-ip-wrapper">
      <div class="sl-ip-left">
      	<div class="sl-ip-ph"></div>
      	<div class="sl-btn-wrapper">
          <small-button @click="ui?.jump(cancelTarget, 'right')" class="u-mr-10">Cancel</small-button>
        </div>
      </div>
      <div class="sl-ip-main">
        <div class="sl-ip-title">{{title}}</div>
        <div class="sl-ip-phone" :style="{ textAlign: centered ? 'center' : 'left' }">{{displayValue}}</div>
        <new-keyboard
          row1="1 2 3"
          row2="4 5 6"
          row3="7 8 9"
          row4="backspace 0 clear"
          clear="X"
          backspace="⌫"
          @input="$emit('input', $event)"
          @backspace="$emit('backspace')"
          @clear="$emit('clear')"
          margin="4px"
          height="100%"
          width="100%"
          font-size="25px"
          class="sl-ip-kb"
		/>
	  </div>
	  <div class="sl-ip-right">
      	<div class="sl-ip-ph"></div>
      	<div class="sl-btn-wrapper">
  	      <small-button @click="$emit('next')" :primary="true" :disabled="!complete" class="next">Next</small-button>
        </div>
	  </div>
    </padding-box>
  </page-body>
</template>
<style scoped>
.sl-ip-title{
	font-size:3vw;
	text-align:left;
	padding-left:2vw;
	padding-top:1vw;
	padding-bottom:1vw;
}
.sl-ip-phone{
	font-size:4vw;
	line-height:4vw;
	height:4vw;
	padding-left:2vw;
	padding-bottom:1vw
}
.sl-ip-ph{
	flex:1
}
.sl-ip-wrapper{
	display:flex
}
.sl-ip-left,.sl-ip-right{
	flex:1;
	display:flex;
	flex-direction:column
}
.sl-ip-kb{
	flex:1
}
.sl-ip-main{
	flex:2;
	display:flex;
	flex-direction:column
}
.next[disabled]{
	background:#ccc !important
}
</style>
<script lang="ts" setup>
import SmallButton from './SmallButton.vue'
import PageBody from './PageBody.vue'
import NewKeyboard from './NewKeyboard.vue'
import PaddingBox from './PaddingBox.vue'
import type { Ui } from '../types'

defineProps<{
  title: string
  displayValue: string
  cancelTarget: string
  complete: boolean
  centered?: boolean
  ui?: Ui
}>()

defineEmits<{
  input: [value: string | undefined]
  backspace: []
  clear: []
  next: []
}>()
</script>
