param location string
param resourceToken string
param tags object
param principalId string
param discordAppId string

@secure()
param discordToken string

param botExists bool

var botName = 'ca-tortle-${resourceToken}'
var acrPullRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
var acrPushRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8311e382-0749-4cb8-b61a-304f252e45ec')

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-tortle-${resourceToken}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource registry 'Microsoft.ContainerRegistry/registries@2025-04-01' = {
  name: 'crtortle${resourceToken}'
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    policies: {
      azureADAuthenticationAsArmPolicy: {
        status: 'enabled'
      }
    }
  }
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-tortle-${resourceToken}'
  location: location
  tags: tags
}

resource pullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, identity.id, acrPullRoleId)
  scope: registry
  properties: {
    roleDefinitionId: acrPullRoleId
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource pushRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, principalId, acrPushRoleId)
  scope: registry
  properties: {
    roleDefinitionId: acrPushRoleId
    principalId: principalId
  }
}

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-tortle-${resourceToken}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

resource existingBot 'Microsoft.App/containerApps@2024-03-01' existing = if (botExists) {
  name: botName
}

module bot './bot.bicep' = {
  name: 'tortle-bot'
  params: {
    name: botName
    location: location
    tags: tags
    environmentId: environment.id
    registryEndpoint: registry.properties.loginServer
    identityId: identity.id
    discordAppId: discordAppId
    discordToken: discordToken
    image: botExists ? existingBot!.properties.template.containers[0].image : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
  }
  dependsOn: [
    pullRole
  ]
}

output registryEndpoint string = registry.properties.loginServer
output registryName string = registry.name
output environmentId string = environment.id
output botName string = bot.outputs.name
