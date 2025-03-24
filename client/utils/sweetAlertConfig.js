import Swal from 'sweetalert2'

// 基本警告/錯誤彈窗樣式
export const errorAlert = Swal.mixin({
  customClass: {
    confirmButton: "btn-custom-confirm-OK",
    popup: "y-custom-popup"
  },
  buttonsStyling: false
})

// 成功彈窗樣式
export const successAlert = Swal.mixin({
  customClass: {
    confirmButton: "btn-custom-confirm-OK",
    popup: "y-custom-popup"
  },
  buttonsStyling: false
})

// 確認操作彈窗樣式
export const confirmAlert = Swal.mixin({
  customClass: {
    confirmButton: "btn-custom-confirm-OK", 
    cancelButton: "btn-custom-cancel",
    popup: "y-custom-popup"
  },
  buttonsStyling: false
})

// 刪除確認彈窗樣式
export const deleteAlert = Swal.mixin({
  customClass: {
    confirmButton: "btn-custom-confirm-delete", 
    cancelButton: "btn-custom-cancel-delete",
    popup: "y-custom-popup"
  },
  buttonsStyling: false
})

// 無按鈕自動關閉提示樣式
export const autoCloseAlert = Swal.mixin({
  timer: 1500,
  timerProgressBar: true,
  showConfirmButton: false,
  customClass: {
    popup: "y-custom-popup"
  }
})