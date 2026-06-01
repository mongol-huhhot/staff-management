<script setup>
    const utiList = [
    { label: 'login.envBtn', value: 'https://www.janga.co.jp/sms/kinou.html#projectTable'},/*動作環境について*/
    { label: 'login.privacyBtn', value: 'https://www.janga.co.jp/SaaSasp/kojinjyouhou.html' },/*個人情報保護/プライバシーポリシー */
    { label: 'login.versionBtn', value: 'https://surupas.native365.net/janga0602/img/check_version.pdf' },/*バージョン確認方法 */
    { label: 'login.whileForgetPasswordBtn', value: 'https://surupas.native365.net/janga0602/password_forget_v2.php' } /*パスワードを忘れた場合 */
    ]
</script>
<template>
    <v-row dense class="px-4">
        <v-col
            v-for="item in utiList"
            :key="item.value"
            cols="6"
            class="d-flex "
        >
            <v-btn
                variant="text"
                :href="item.value"
                target="_blank"
                class="text-caption"
            >
                {{ $t(item.label) }}
            </v-btn>
        </v-col>
    </v-row>
</template>
