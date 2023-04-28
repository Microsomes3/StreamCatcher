function getStreamCatcherJobDescription({
    id,
    jobId,
    reqId,
    storage = "1Gi",
    isStart = "false",
    provider = "youtube",
    timeout,
    updateHook="https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoOnUpdateRecordCallback",
    url
}){
var job = {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: id,
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: 'streamcapture1',
              image: 'rg.fr-par.scw.cloud/streamcaptureintel/ex:latest',
              resources: {
                requests: {
                  cpu: '0.1',
                  'ephemeral-storage': storage
                },
              },
              env: [
                { name: 'AWS_REGION_T', value: 'us-east-1' },
                { name: 'isstart', value: isStart },
                { name: 'jobid', value: jobId },
                { name: 'provider', value: provider },
                { name: 'RECORD_REQUEST_ID', value: reqId },
                { name: 'reqid', value: reqId},
                { name: 'timeout', value: timeout },
                { name: 'updatehook', value: updateHook },
                { name: 'url', value: url },
              ],
            },
          ],
          imagePullSecrets: [
            { name: 'regcred2' },
          ],
          restartPolicy: 'Never',
        },
      },
      backoffLimit: 4,
    },
  };

  return job;
}

function getMuxJobDescription({
    id,
    jobId,
    reqId,
    storage,
    videoLink,
    audioLink,
    updateHook="https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoMuxUpdateRecordCallback",
}){
var job = {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
        name: id,
        labels:{
          app: 'mux'
        },
      },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: 'mux1',
              image: 'rg.fr-par.scw.cloud/muxintel/mux:latest',
              resources: {
                requests: {
                  cpu: '2.0',
                  'ephemeral-storage': storage,
                   memory: '2Gi',
                },
                limits: {
                    cpu: '2.0',
                    'ephemeral-storage': storage,
                    memory: '2Gi',
                },
              },
              env: [
                { name: 'AWS_REGION_T', value: 'us-east-1' },
                { name: 'jobid', value: jobId },
                { name: 'RECORD_REQUEST_ID', value: reqId },
                { name: 'reqid', value: reqId},
                { name: 'updatehook', value: updateHook },
                {name:'audioLink', value: audioLink},
                {name:'videoLink', value: videoLink}
              ],
            },
          ],
          imagePullSecrets: [
            { name: 'regcred2' },
          ],
          restartPolicy: 'Never',
        },
      },
      backoffLimit: 4,
    },
  };

  return job;
}

function getCommentVideCaptureJobDescription({
  duration,
  username,
  id
}){
  return new Promise((resolve,reject)=>{
    var job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
          name: id,
          labels:{
            app: 'com'
          },
        },
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'commentvideso',
                image: 'rg.fr-par.scw.cloud/commentcaptutuevideo/vid:latest',
                resources: {
                  requests: {
                    cpu: '2.0',
                    'ephemeral-storage': "2Gi",
                     memory: '2Gi',
                  },
                  limits: {
                      cpu: '2.0',
                      'ephemeral-storage': "2Gi",
                      memory: '2Gi',
                  },
                },
                env: [
                  { name: 'username', value: username },
                  { name: 'timeout', value: duration.toString()},
                  {name:"AWS_ACCESS_KEY_ID", value:"AKIAYLLIOITR3ZPZD2SU"},
                  {name:"AWS_SECRET_ACCESS_KEY", value:"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"}

                ],
              },
            ],
            imagePullSecrets: [
              { name: 'regcred2' },
            ],
            restartPolicy: 'Never',
          },
        },
        backoffLimit: 4,
      },
    };
  
    resolve(job);
  })
}





module.exports = {
    getStreamCatcherJobDescription,
    getMuxJobDescription,
    getCommentVideCaptureJobDescription
}