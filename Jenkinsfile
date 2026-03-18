pipeline {
    agent any

    environment {
        ENV_FILE = credentials('findsmart-env')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Preparar Configuración') {
            steps {
                sh 'cp $ENV_FILE .env'
            }
        }

        stage('Desplegar Aplicación') {
            steps {
                script {
                    def dockerCmd = sh(script: "docker compose version", returnStatus: true) == 0 ? "docker compose" : "docker-compose"
                    sh "${dockerCmd} up -d --build"
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f .env'
        }
        success {
            echo '¡Frontend de FindSmart desplegado con éxito!'
        }
        failure {
            echo 'Fallo en el despliegue. Revisa los logs de los contenedores en Portainer.'
        }
    }
}
