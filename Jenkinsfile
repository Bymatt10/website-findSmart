pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Descarga el código de GitHub según la configuración del Job
                checkout scm
            }
        }

        stage('Preparar Credenciales (ENV)') {
            steps {
                // Extrae el archivo secreto y lo inyecta como .env para el build de Docker
                withCredentials([file(credentialsId: 'findsmart-env', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                }
            }
        }

        stage('Desplegar Aplicación') {
            steps {
                script {
                    // Verificamos cuál comando está disponible en el Jenkins actual
                    def dockerCmd = sh(script: "docker compose version", returnStatus: true) == 0 ? "docker compose" : "docker-compose"
                    
                    echo "Usando comando: ${dockerCmd}"
                    
                    // Ejecuta el despliegue: levanta Redis y construye la App de React Router v7
                    sh "${dockerCmd} up -d --build"
                }
            }
        }
    }

    post {
        always {
            // Borramos el .env del espacio de trabajo para proteger tus llaves de Gemini/Supabase
            sh 'rm -f .env'
        }
        success {
            echo '¡Despliegue exitoso! FindSmart está corriendo en el puerto 3000.'
        }
        failure {
            echo 'Fallo en el despliegue. Revisa los logs de los contenedores en Portainer.'
        }
    }
}