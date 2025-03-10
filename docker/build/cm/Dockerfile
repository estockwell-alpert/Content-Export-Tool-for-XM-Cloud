# escape=`


ARG BASE_IMAGE
ARG SXA_IMAGE
ARG SPE_IMAGE
ARG TOOLING_IMAGE
ARG JSS_IMAGE
ARG CLI_IMAGE
ARG MGSV_IMAGE

FROM ${TOOLING_IMAGE} as tooling
FROM ${SXA_IMAGE} as sxa
FROM ${SPE_IMAGE} as spe 
FROM ${CLI_IMAGE} AS cli
FROM ${JSS_IMAGE} AS jss
FROM ${MGSV_IMAGE} as mgsv
FROM ${BASE_IMAGE}

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Add SPE module
COPY --from=spe \module\cm\content .\

# Add SXA module
COPY --from=sxa \module\cm\content .\
COPY --from=sxa \module\tools \module\tools
RUN C:\module\tools\Initialize-Content.ps1 -TargetPath .\; `
    Remove-Item -Path C:\module -Recurse -Force;
 

# Copy development tools and entrypoint
COPY --from=tooling \tools\ \tools\

# Copy role transforms
COPY .\transforms\ \transforms\role\

# Perform role transforms
RUN C:\tools\scripts\Invoke-XdtTransform.ps1 -Path .\ -XdtPath C:\transforms\role

# Add CLI tools
COPY --from=cli C:\module\cm\content C:\inetpub\wwwroot

# Add JSS module
COPY --from=jss \module\cm\content .\
COPY --from=jss \module\tools C:\module\tools
RUN C:\module\tools\Initialize-Content.ps1 -TargetPath C:\inetpub\wwwroot; `
  Remove-Item -Path C:\module -Recurse -Force;

# Management services
COPY --from=mgsv C:\module\cm\content C:\inetpub\wwwroot