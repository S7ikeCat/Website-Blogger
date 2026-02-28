import Swal from "sweetalert2";

/**
 * Tailwind-ish theme for SweetAlert2.
 * Use: await swal.fire({...})
 */
export const swal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "card-solid !p-6 !text-left !text-zinc-50 !rounded-3xl",
    title: "!text-xl !font-bold !text-white !p-0",
    htmlContainer: "!text-sm !text-zinc-200 !mt-2",
    actions: "!mt-5 !gap-2",
    confirmButton: "btn btn-primary",
    cancelButton: "btn btn-ghost",
    denyButton: "btn",
    input: "input",
    closeButton: "!text-zinc-300 hover:!text-white",
  },
  showClass: {
    popup: "animate-pop",
  },
  hideClass: {
    popup: "opacity-0",
  },
});
