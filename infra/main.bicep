targetScope = 'subscription'

@minLength(1)
@maxLength(64)
param environmentName string

@minLength(1)
param location string

@description('Object ID of the deploying user or service principal.')
param principalId string

@minLength(1)
param discordAppId string

@secure()
@minLength(1)
param discordToken string

@description('Set by azd after deployment to preserve the running image on reprovision.')
param botExists bool = false

var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
}

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-tortle-${resourceToken}'
  location: location
  tags: tags
}

module resources './resources.bicep' = {
  name: 'tortle-resources'
  scope: resourceGroup
  params: {
    location: location
    resourceToken: resourceToken
    tags: tags
    principalId: principalId
    discordAppId: discordAppId
    discordToken: discordToken
    botExists: botExists
  }
}

output AZURE_RESOURCE_GROUP string = resourceGroup.name
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.registryEndpoint
output AZURE_CONTAINER_REGISTRY_NAME string = resources.outputs.registryName
output AZURE_CONTAINER_APPS_ENVIRONMENT_ID string = resources.outputs.environmentId
output SERVICE_BOT_NAME string = resources.outputs.botName
