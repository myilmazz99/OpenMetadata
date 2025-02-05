---
title: Run Atlas Connector using the CLI
slug: /connectors/metadata/atlas/cli
---

# Run Atlas using the metadata CLI

In this section, we provide guides and references to use the Atlas connector.

Configure and schedule Atlas metadata and profiler workflows from the OpenMetadata UI:

- [Requirements](#requirements)
- [Metadata Ingestion](#metadata-ingestion)


## Requirements

Before this, you must ingest the database / messaging service you want to get metadata for. 
For more details click [here](/connectors/metadata/atlas#create-database-service)

{%inlineCallout icon="description" bold="OpenMetadata 0.12 or later" href="/deployment"%}
To deploy OpenMetadata, check the Deployment guides.
{%/inlineCallout%}

To run the Ingestion via the UI you'll need to use the OpenMetadata Ingestion Container, which comes shipped with
custom Airflow plugins to handle the workflow deployment.

### Python Requirements

To run the Atlas ingestion, you will need to install:

```bash
pip3 install "openmetadata-ingestion[atlas]"
```

## Metadata Ingestion

All connectors are defined as JSON Schemas.
[Here](https://github.com/open-metadata/OpenMetadata/blob/main/openmetadata-spec/src/main/resources/json/schema/entity/services/connections/metadata/atlasConnection.json)
you can find the structure to create a connection to Atlas.

In order to create and run a Metadata Ingestion workflow, we will follow
the steps to create a YAML configuration able to connect to the source,
process the Entities if needed, and reach the OpenMetadata server.

The workflow is modeled around the following
[JSON Schema](https://github.com/open-metadata/OpenMetadata/blob/main/openmetadata-spec/src/main/resources/json/schema/metadataIngestion/workflow.json)

### 1. Define the YAML Config

{% codePreview %}

{% codeInfoContainer %}

#### Source Configuration - Service Connection

{% codeInfo srNumber=12 %}

**hostPort**: Atlas Host of the data source.

{% /codeInfo %}

{% codeInfo srNumber=13 %}

**username**: Username to connect to the Atlas. This user should have privileges to read all the metadata in Atlas.

{% /codeInfo %}

{% codeInfo srNumber=14 %}

**password**: Password to connect to the Atlas.

{% /codeInfo %}

{% codeInfo srNumber=15 %}

**databaseServiceName**: source database of the data source(Database service that you created from UI. example- local_hive).

{% /codeInfo %}

{% codeInfo srNumber=16 %}

**messagingServiceName**: messaging service source of the data source.

{% /codeInfo %}

{% codeInfo srNumber=17 %}

**entity_type**: Name of the entity type in Atlas.

{% /codeInfo %}

#### Sink Configuration

{% codeInfo srNumber=18 %}

To send the metadata to OpenMetadata, it needs to be specified as `type: metadata-rest`.

{% /codeInfo %}

{% partial file="workflow-config.md" /%}
{% /codeInfoContainer %}

{% codeBlock fileName="filename.yaml" %}

```yaml
source:
  type: Atlas
  serviceName: local_atlas
  serviceConnection:
    config:
      type: Atlas
```
```yaml {% srNumber=12 %}
      hostPort: http://localhost:10000
```
```yaml {% srNumber=13 %}
      username: username
```
```yaml {% srNumber=14 %}
      password: password
```
```yaml {% srNumber=15 %}
      databaseServiceName: ["local_hive"] # create database service and messaging service and pass `service name` here
```
```yaml {% srNumber=16 %}
      messagingServiceName: []
```
```yaml {% srNumber=17 %}
      entity_type: Table
  sourceConfig:
    config:
      type: DatabaseMetadata
```
```yaml {% srNumber=18 %}
sink:
  type: metadata-rest
  config: {}
```

{% partial file="workflow-config-yaml.md" /%}

{% /codeBlock %}

{% /codePreview %}

### 2. Run with the CLI

First, we will need to save the YAML file. Afterward, and with all requirements installed, we can run:

```bash
metadata ingest -c <path-to-yaml>
```

Note that from connector to connector, this recipe will always be the same. By updating the YAML configuration,
you will be able to extract metadata from different sources.
