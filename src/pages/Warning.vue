<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Warning!"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-info-text">
					<div>
						If you<br/> open the cell,<br/>
						the rental will<br/> be terminated!
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="ui?.jump('MainMenu','right')" style="margin-right:10px">Exit</small-button>
			    	<small-button @click="ui?.jump('OpenCell','left')" :primary="true">Open cell</small-button>
				</div>
			</div>
			<div class="sl-info-right"></div>
		</div>
    </padding-box>
  </page-body>
</template>
<style scoped lang="scss">
@use '../assets/css/info-page';
.sl-info-right{
	background-image:url(/img/warning.png)
}
</style>
<script lang="ts" setup>
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import type { Ui } from '../types'

defineProps<{ ui?: Ui }>()
</script>
