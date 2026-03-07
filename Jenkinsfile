pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Preparar Credenciales (ENV)') {
            steps {
                // Requiere el plugin "Credentials Binding" en Jenkins
                // Y una credencial de tipo "Secret file" con el ID 'findsmart-env'
                withCredentials([file(credentialsId: 'findsmart-env', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                }
            }
        }

        stage('Desplegar Aplicación (Docker Compose)') {
            steps {
                // Utiliza docker compose para construir y levantar todo (App + Redis)
                sh "docker compose up -d --build"
            }
        }
    }

    post {
        always {
            // Limpiar las variables de entorno para mayor seguridad (se elimina del workspace de Jenkins)
            sh 'rm -f .env'
        }
    }
}
