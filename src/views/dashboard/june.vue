<template>
  <div class="app-container">
    <p>1.会员中的顺序表示<strong>预设</strong>中奖顺序</p>
    <p>2.顺序中的数字表示奖品的编号、？表示<strong>随机</strong>并用‘,’隔开</p>
    <p>3.例如：'1,3,?,1'表示四次奖品按礼品编号为1、3、随机、1</p>
    <p>4.注：顺序中的数字一定要在相应的玩家组中找到<strong>对应</strong>的礼品编号</p>
    <p>5.编辑玩家时有“下次序号”，表示下次玩家的礼品对应“顺序”的第几个</p>
    <p>6.会员编辑的“顺序”中红色数字表示<strong>已经抽取</strong>的礼品编号</p>
    <p>7.导入Excel模板中user(用户名)、sequence(顺序)、score(次数)、type(组别)</p>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>

</style>
