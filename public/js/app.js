import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener('DOMContentLoaded', () => {
  const skills = document.querySelector('.lista-conocimientos');
  let alertas = document.querySelector('.alertas');

  if (alertas) {
    limpiarAlertas();
  }

  if (skills) {
    skills.addEventListener('click', agregarSkills);
    skillsSeleccionados();
  }

  const vacantesListado = document.querySelector('.lista-vacantes');
  
  if (vacantesListado) {
    vacantesListado.addEventListener('click', accionesListado);
  }
});

const skills = new Set();

const agregarSkills = e => {
  if (e.target.tagName === 'LI') {
    if (e.target.classList.contains('activo')) {
      skills.delete(e.target.textContent);
      e.target.classList.remove('activo');
    }else{
      skills.add(e.target.textContent);
      e.target.classList.add('activo');
    }
  }
  const skillsArray = [...skills]
  document.querySelector('#skills').value = skillsArray;
}
const skillsSeleccionados = () => {
  const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
  seleccionadas.forEach(elegida => {
    skills.add(elegida.textContent);
  });
  const skillsArray = [...skills];
  document.querySelector('#skills').value = skillsArray;
}
const limpiarAlertas = () => {
  const alertas = document.querySelector('.alertas')

  const interval = setInterval(() => {
    if (alertas.children.length > 0) {
      alertas.removeChild(alertas.children[0])
    }else if(alertas.children.length === 0){
      alertas.parentElement.removeChild(alertas);
      clearInterval(interval);
    }
  }, 2000);
}
const accionesListado = e => {
  // Verificar si el elemento presionado (o su contenedor) tiene el data-attribute
  const enlaceEliminar = e.target.dataset.eliminar ? e.target : e.target.closest('[data-eliminar]');

  if (enlaceEliminar) {
    e.preventDefault(); // Detener la navegación solo si se presionó eliminar
    
    const id = enlaceEliminar.dataset.eliminar;

    Swal.fire({
      title: "¿Confirmar eliminación?",
      text: "¡Una vez eliminada, no se puede recuperar!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "¡No, cancelar!"
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `${location.origin}/vacantes/eliminar/${id}`;
        
        axios.delete(url, {params: {url}})
          .then(function(respuesta) {
            if (respuesta.status === 200) {
              Swal.fire({
                title: "¡Eliminado!",
                text: respuesta.data,
                icon: "success"
              });
              e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
            }
          })
          .catch(() => {
            Swal.fire({
              title: 'Hubo un erro',
              text: 'No se pudo eliminar',
              icon: "error"
            })
          })
        
      }
    });
  } else if (e.target.tagName === 'A') {
    // Si es otro enlace del listado (como Editar o Candidatos), permite su comportamiento habitual
    window.location.href = e.target.href;
  }
}