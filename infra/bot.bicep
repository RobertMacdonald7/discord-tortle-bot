param name string
param location string
param tags object
param environmentId string
param registryEndpoint string
param identityId string
param discordAppId string

@secure()
param discordToken string

param image string

resource bot 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  tags: union(tags, {
    'azd-service-name': 'bot'
  })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: environmentId
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registryEndpoint
          identity: identityId
        }
      ]
      secrets: [
        {
          name: 'discord-token'
          value: discordToken
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'bot'
          image: image
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'APP_ID'
              value: discordAppId
            }
            {
              name: 'DISCORD_TOKEN'
              secretRef: 'discord-token'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

output name string = bot.name
